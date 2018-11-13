<?php

namespace App\Query;

use App\Entity\BusStopGroup;
use App\ViewData\BusStopGroupData;
use Doctrine\ORM\AbstractQuery;
use Doctrine\ORM\EntityManagerInterface;
use Ramsey\Uuid\UuidInterface;

class GetBusStopGroupQuery implements QueryInterface
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function __invoke(UuidInterface $id): ?BusStopGroupData
    {
        $queryBuilder = $this->entityManager->createQueryBuilder();
        $queryBuilder->from(BusStopGroup::class, 'busStopGroup');
        $queryBuilder->select(
            'busStopGroup.id',
            'busStopGroup.name'
        );
        $queryBuilder->where('busStopGroup.id = :id');
        $queryBuilder->setParameter('id', $id);
        $queryBuilder->groupBy('busStopGroup.id');
        $query = $queryBuilder->getQuery();
        $data = $query->getOneOrNullResult(AbstractQuery::HYDRATE_ARRAY);
        if ($data) {
            return new BusStopGroupData($data['id'], $data['name']);
        }
        return null;
    }
}