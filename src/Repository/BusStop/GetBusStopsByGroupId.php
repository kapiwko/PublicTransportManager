<?php

namespace App\Repository\BusStop;

use App\Entity\BusStop;
use Doctrine\ORM\EntityManagerInterface;
use Ramsey\Uuid\UuidInterface;

class GetBusStopsByGroupId
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    /**
     * @return array|BusStop[]
     */
    public function __invoke(UuidInterface $group): array
    {
        $queryBuilder = $this->entityManager->createQueryBuilder();
        $queryBuilder->select('busStop');
        $queryBuilder->from(BusStop::class,'busStop');
        $queryBuilder->where('busStop.group = :group');
        $queryBuilder->setParameter('group', $group);
        $queryBuilder->groupBy('busStop.id');
        $query = $queryBuilder->getQuery();
        return $query->getResult();
    }
}