<?php

namespace App\Query;

use App\Entity\Connection;
use App\ViewData\ConnectionData;
use Doctrine\ORM\AbstractQuery;
use Doctrine\ORM\EntityManagerInterface;
use Ramsey\Uuid\Uuid;
use Ramsey\Uuid\UuidInterface;

class GetConnectionQuery implements QueryInterface
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function __invoke(UuidInterface $id): ?ConnectionData
    {
        $queryBuilder = $this->entityManager->createQueryBuilder();
        $queryBuilder->from(Connection::class, 'connection');
        $queryBuilder->select(
            'connection.id',
            'IDENTITY(connection.from) as from',
            'IDENTITY(connection.to) as to',
            'connection.geometry'
        );
        $queryBuilder->where('connection.id = :id');
        $queryBuilder->setParameter('id', $id);
        $queryBuilder->groupBy('connection.id');
        $query = $queryBuilder->getQuery();

        $data = $query->getOneOrNullResult(AbstractQuery::HYDRATE_ARRAY);
        if ($data) {
            $from = $data['from'] ? Uuid::fromString($data['from']) : null;
            $to = $data['to'] ? Uuid::fromString($data['to']) : null;
            return new ConnectionData($data['id'], $from, $to, $data['geometry']);
        }
        return null;
    }
}