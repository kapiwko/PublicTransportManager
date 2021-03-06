<?php

namespace App\Query;

use App\Entity\Connection;
use App\ViewData\ConnectionData;
use App\ViewData\ConnectionDataCollection;
use Doctrine\ORM\AbstractQuery;
use Doctrine\ORM\EntityManagerInterface;
use Ramsey\Uuid\Uuid;

class GetAllConnectionsQuery implements QueryInterface
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function __invoke(): ConnectionDataCollection
    {
        $queryBuilder = $this->entityManager->createQueryBuilder();
        $queryBuilder->from(Connection::class, 'connection');
        $queryBuilder->select(
            'connection.id',
            'IDENTITY(connection.from) as from',
            'IDENTITY(connection.to) as to',
            'connection.geometry'
        );
        $queryBuilder->groupBy('connection.id');
        $query = $queryBuilder->getQuery();

        $collection = new ConnectionDataCollection();
        foreach ($query->getResult(AbstractQuery::HYDRATE_ARRAY) as $data) {
            $from = $data['from'] ? Uuid::fromString($data['from']) : null;
            $to = $data['to'] ? Uuid::fromString($data['to']) : null;
            $collection->add(new ConnectionData($data['id'], $from, $to, $data['geometry']));
        }
        return $collection;
    }
}